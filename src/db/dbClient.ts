import { PrismaClient } from "@prisma/client";

class DBClient extends PrismaClient {
  private static instance: PrismaClient;

  private constructor() {
    super();
  }
  
  static getInstance() {
    if (!this.instance) {
      DBClient.instance = new DBClient();
    }
    return DBClient.instance;
  }
}

export const db = DBClient.getInstance();
