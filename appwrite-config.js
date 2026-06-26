import { Client, Account, Databases, Storage } from "https://cdn.jsdelivr.net/npm/appwrite@16.0.2/+esm";

const client = new Client();

client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("6a3eb817001acd81b9ee");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
