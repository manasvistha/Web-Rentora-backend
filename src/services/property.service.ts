import { PropertyRepository } from "../repositories/property.repository";
import { NotificationService } from "./notification.service";
import { CreatePropertyDto, UpdatePropertyDto } from "../dtos/property.dto";

export class PropertyService {
  private propertyRepository = new PropertyRepository();
  private notificationService = new NotificationService();

  async createProperty(data: CreatePropertyDto, ownerId: string) {
    const property = await this.propertyRepository.create({ ...data, owner: ownerId });
    return property;
  }

  async getAllProperties() {
    const properties = await this.propertyRepository.findAll();
    const baseUrl = (process.env.BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

    const makeFullUrl = (image: string) => {
      if (!image) return image;
      // If already absolute URL, return as is
      if (/^https?:\/\//i.test(image)) return image;
      // Ensure single slash between base and path
      return `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
    };

    return properties.map((property) => {
      property.images = property.images.map((image) => makeFullUrl(image));
      return property;
    });
  }

  async getPropertyById(id: string) {
    const property = await this.propertyRepository.findById(id);
    if (property) {
      const baseUrl = (process.env.BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
      const makeFullUrl = (image: string) => {
        if (!image) return image;
        if (/^https?:\/\//i.test(image)) return image;
        return `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
      };
      property.images = property.images.map((image) => makeFullUrl(image));
    }
    return property;
  }

  async getPropertiesByOwner(ownerId: string) {
    return await this.propertyRepository.findByOwner(ownerId);
  }

  async searchByLocation(location: string) {
    return await this.propertyRepository.findByLocation(location);
  }

  async updateProperty(id: string, data: UpdatePropertyDto, ownerId: string) {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new Error("Property not found");
    if (property.owner.toString() !== ownerId) throw new Error("Unauthorized");

    return await this.propertyRepository.update(id, data);
  }

  async deleteProperty(id: string, ownerId: string) {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new Error("Property not found");
    if (property.owner.toString() !== ownerId) throw new Error("Unauthorized");

    return await this.propertyRepository.delete(id);
  }

  async assignProperty(propertyId: string, userId: string, adminId: string) {
    // Only admin can assign
    const property = await this.propertyRepository.assignToUser(propertyId, userId);
    if (property) {
      await this.notificationService.createNotification(
        property.owner.toString(),
        `Your property "${property.title}" has been assigned to a user.`,
        'assignment',
        propertyId
      );
      await this.notificationService.createNotification(
        userId,
        `You have been assigned the property "${property.title}".`,
        'assignment',
        propertyId
      );
    }
    return property;
  }

  async updatePropertyStatus(propertyId: string, status: 'available' | 'assigned' | 'booked', adminId: string) {
    const property = await this.propertyRepository.updateStatus(propertyId, status);
    if (property) {
      await this.notificationService.createNotification(
        property.owner.toString(),
        `Status of your property "${property.title}" updated to ${status}.`,
        'status_update',
        propertyId
      );
      if (property.assignedTo) {
        await this.notificationService.createNotification(
          property.assignedTo.toString(),
          `Status of property "${property.title}" updated to ${status}.`,
          'status_update',
          propertyId
        );
      }
    }
    return property;
  }
}