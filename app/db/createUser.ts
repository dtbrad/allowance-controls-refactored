import hashPassword from "~/helpers-server/hashPassword.server";
import prisma from "./prisma";
import {DayofWeek} from "@prisma/client";

export interface CreateUserParams {
    id: string;
    password: string;
    amount: number;
    dayPreference: string;
}

export default async function createUser({
    id,
    password,
    amount,
    dayPreference
}: CreateUserParams) {
    return await prisma.user.create({
        data: {
            id: id,
            passwordDigest: hashPassword(password),
            allowanceAmount: amount * 100,
            allowanceDay: dayPreference as DayofWeek
        }
    });
}
