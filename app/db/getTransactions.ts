import prisma from "~/db/prisma";

export const pageSize = 12;

// TODO: use raw sql to get data in one query
export default async function getTransactions(userId: string, pageNumber = 1) {
    const total = await prisma.transaction.count({
        where: {userId: userId}
    });

    const transactions = await prisma.transaction.findMany({
        where: {userId: userId},
        orderBy: {transactionDate: "desc"},
        take: pageSize,
        skip: pageSize * (pageNumber - 1)
    });

    return {
        totalPages: Math.ceil(total / pageSize),
        transactions
    };
}
