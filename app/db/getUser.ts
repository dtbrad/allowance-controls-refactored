import prisma from "~/db/prisma";

export default async function getUser(id: string) {
    return await prisma.user.findUnique({
        where: {id: id}
    });
}
