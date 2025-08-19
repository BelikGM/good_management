export class RepositoryFake {
  public create(): void {}
  public async save(): Promise<void> {}
  public async insert(): Promise<object> {
    return {
      identifiers: [{ id: 'mockId' }],
      generatedMaps: [],
      raw: [],
    };
  }
  public async delete(): Promise<void> {}
  public async findOne(): Promise<void> {}
  public async find(): Promise<void> {}
  public async update(): Promise<void> {}
  public createQueryBuilder(): any {
    return {
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(undefined), // По умолчанию возвращаем `undefined`
    };
  }
}
