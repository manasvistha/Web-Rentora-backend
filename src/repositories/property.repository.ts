import Property, { IProperty } from "../models/property.model";
import { CreatePropertyDto, UpdatePropertyDto } from "../dtos/property.dto";

export class PropertyRepository {
  async create(data: CreatePropertyDto & { owner: string }): Promise<IProperty> {
    const property = new Property(data);
    return await property.save();
  }

  async findAll(): Promise<IProperty[]> {
    // Return raw property documents; URL normalization is handled in the service layer
    return await Property.find().populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IProperty | null> {
    return await Property.findById(id).populate('owner', 'name email').populate('assignedTo', 'name email');
  }

  async findByOwner(ownerId: string): Promise<IProperty[]> {
    return await Property.find({ owner: ownerId }).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async findByQuery(query: string): Promise<IProperty[]> {
    return await Property.find({
      $or: [
        { location: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } }
      ]
    }).populate('owner', 'name email');
  }

  async update(id: string, data: UpdatePropertyDto): Promise<IProperty | null> {
    return await Property.findByIdAndUpdate(id, data, { new: true }).populate('owner', 'name email');
  }

  async delete(id: string): Promise<boolean> {
    const result = await Property.findByIdAndDelete(id);
    return !!result;
  }

  async assignToUser(propertyId: string, userId: string): Promise<IProperty | null> {
    return await Property.findByIdAndUpdate(
      propertyId,
      { assignedTo: userId, status: 'assigned' },
      { new: true }
    ).populate('owner', 'name email').populate('assignedTo', 'name email');
  }

  async updateStatus(propertyId: string, status: 'pending' | 'approved' | 'rejected' | 'available' | 'assigned' | 'booked'): Promise<IProperty | null> {
    return await Property.findByIdAndUpdate(propertyId, { status }, { new: true });
  }
}