import prisma from "~/db/prisma";

export default async function getUserBalance(userId: string, pageNumber = 1) {
    const {
        _sum: {amount}
    } = await prisma.transaction.aggregate({
        _sum: {amount: true},
        where: {userId}
    });

    return amount || 0;
}
