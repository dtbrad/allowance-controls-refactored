import prisma from "~/db/prisma";

export default async function getUserSummaries() {
    const users = await prisma.user.findMany();

    const balances = await prisma.transaction.groupBy({
        by: ["userId"],
        _sum: {
            amount: true
        }
    });

    return users.map(({passwordDigest, ...user}) => {
        const balance =
            balances.find((sum) => sum.userId === user.id)?._sum.amount || 0;
        return {
            ...user,
            balance
        };
    });
}
