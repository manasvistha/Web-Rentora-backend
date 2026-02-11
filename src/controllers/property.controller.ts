import { Request, Response } from "express";
import { PropertyService } from "../services/property.service";
import { CreatePropertySchema, CreatePropertyDto, UpdatePropertyDto } from "../dtos/property.dto";

export class PropertyController {
  private propertyService = new PropertyService();

  async createProperty(req: Request, res: Response) {
    try {
      console.log('Create property request:', {
        body: req.body,
        files: req.files,
        user: (req as any).user
      });

      // Parse form data and validate
      const rawData = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        price: req.body.price ? parseFloat(req.body.price) : 0,
        availability: req.body.availability ? JSON.parse(req.body.availability) : [],
        images: req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : []
      };

      console.log('Parsed data:', rawData);

      const data = CreatePropertySchema.parse(rawData);
      console.log('Validated data:', data);

      const ownerId = (req as any).user.id;
      console.log('Owner ID:', ownerId);

      // Handle uploaded images
      const images: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        images.push(...req.files.map((file: any) => `/public/property-images/${file.filename}`));
      }

      // Add images to data
      data.images = images;

      console.log('Parsed data:', data);

      const property = await this.propertyService.createProperty(data, ownerId);
      console.log('Property created successfully:', property);
      res.status(201).json(property);
    } catch (error: any) {
      console.error('Property creation error:', error);
      console.error('Error stack:', error.stack);
      res.status(400).json({ error: error.message });
    }
  }

  async getAllProperties(req: Request, res: Response) {
    try {
      const properties = await this.propertyService.getAllProperties();
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPropertyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const property = await this.propertyService.getPropertyById(id);
      if (!property) return res.status(404).json({ error: "Property not found" });
      res.json(property);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMyProperties(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user.id;
      const properties = await this.propertyService.getPropertiesByOwner(ownerId);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async searchByLocation(req: Request, res: Response) {
    try {
      const { location } = req.query;
      if (!location || typeof location !== 'string') {
        return res.status(400).json({ error: "Location query required" });
      }
      const properties = await this.propertyService.searchByLocation(location);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProperty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdatePropertyDto = req.body;
      const ownerId = (req as any).user.id;
      const property = await this.propertyService.updateProperty(id, data, ownerId);
      if (!property) return res.status(404).json({ error: "Property not found" });
      res.json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteProperty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ownerId = (req as any).user.id;
      const success = await this.propertyService.deleteProperty(id, ownerId);
      if (!success) return res.status(404).json({ error: "Property not found" });
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async assignProperty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const adminId = (req as any).user.id;
      if ((req as any).user.role !== 'admin') return res.status(403).json({ error: "Admin required" });
      const property = await this.propertyService.assignProperty(id, userId, adminId);
      if (!property) return res.status(404).json({ error: "Property not found" });
      res.json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePropertyStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = (req as any).user.id;
      if ((req as any).user.role !== 'admin') return res.status(403).json({ error: "Admin required" });
      const property = await this.propertyService.updatePropertyStatus(id, status, adminId);
      if (!property) return res.status(404).json({ error: "Property not found" });
      res.json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}