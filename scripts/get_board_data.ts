import { PrismaClient } from '../prisma/generated-client';

const prisma = new PrismaClient();

async function main() {
    const id = process.argv[2];
    if (!id) {
        console.error("Please provide a board ID");
        process.exit(1);
    }

    try {
        const board = await prisma.bBSchemeState.findUnique({
            where: { id }
        });

        if (!board) {
            console.error("Board not found");
        } else {
            console.log(JSON.stringify(JSON.parse(board.data), null, 2));
        }
    } catch (e) {
        console.error("Query failed", e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
