import {PrismaClient} from "@prisma/client";
import {createHmac} from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string) {
    const hash = createHmac("sha512", process.env.SALT!);
    hash.update(password);
    return hash.digest("hex");
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
}

const descriptions = [
    "Groceries",
    "Entertainment",
    "Education",
    "Miscellaneous",
    "Transportation"
];

async function main() {
    // Admin user
    await prisma.user.create({
        data: {
            id: "admin",
            passwordDigest: hashPassword("password"),
            role: "ADMIN",
            allowanceAmount: 10 * 100,
            allowanceDay: "SUNDAY"
        }
    });

    // Standard user
    const standardUser = await prisma.user.create({
        data: {
            id: "standardUser",
            passwordDigest: hashPassword("userPassword"),
            role: "STANDARD",
            allowanceAmount: 5 * 100,
            allowanceDay: "SUNDAY"
        }
    });

    // Creating 400 transactions
    let transactions = [];
    for (let i = 0; i < 200; i++) {
        // Weekly Allowance transactions
        transactions.push({
            userId: standardUser.id,
            amount: standardUser.allowanceAmount,
            transactionDate: new Date(2023, 0, 1 + 7 * i), // Assuming a start date and creating weekly increments
            description: "Weekly Allowance"
        });

        // Random transactions
        transactions.push({
            userId: standardUser.id,
            amount: getRandomInt(1, 100) * 100, // Random amount
            transactionDate: randomDate(
                new Date(2023, 0, 1),
                new Date(2023, 11, 31)
            ), // Random date within the year
            description: descriptions[getRandomInt(0, descriptions.length - 1)] // Random description
        });
    }

    // Batch create transactions
    for (const transaction of transactions) {
        await prisma.transaction.create({
            data: transaction
        });
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
