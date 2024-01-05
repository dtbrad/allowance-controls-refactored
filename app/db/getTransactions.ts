import prisma from "~/db/prisma";

export default async function getTransactions(userId: string) {
    const total = await prisma.transaction.count({
        where: {userId: userId}
    });

    const transactions = await prisma.transaction.findMany({
        where: {userId: userId},
        orderBy: {transactionDate: "desc"}
    });

    return {
        transactions
    };
}
