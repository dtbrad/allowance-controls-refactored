import prisma from "~/db/prisma";

export default async function deleteUser(userId: string) {
    await prisma.transaction.deleteMany({where: {userId: userId as string}});
    await prisma.user.delete({where: {id: userId as string}});
}
