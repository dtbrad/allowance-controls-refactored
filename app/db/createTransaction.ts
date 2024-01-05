import prisma from "./prisma";

export default async function createTransaction(
    userId: string,
    amount: number,
    description: string
) {
    return await prisma.transaction.create({
        data: {
            userId: userId,
            amount: amount * 100,
            description
        }
    });
}
