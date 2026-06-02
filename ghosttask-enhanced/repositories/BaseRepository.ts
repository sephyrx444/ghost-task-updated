import { Model, Document } from 'mongoose';

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async find(filter: any = {}, projection?: any, options?: any): Promise<T[]> {
    return this.model.find(filter, projection, options).exec();
  }

  async findOne(filter: any): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string, data: any): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter: any = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
