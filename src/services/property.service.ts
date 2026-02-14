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
    return await this.propertyRepository.findAll();
  }

  async getPropertyById(id: string) {
    return await this.propertyRepository.findById(id);
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