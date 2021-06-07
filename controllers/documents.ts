// import { PrismaClient } from '@prisma/client'
// import express from "express";
// const prisma = new PrismaClient()

// const router = express.Router();
// router.get("/documents", async (req, res) => {

//     const allUserDocuments = await prisma.document.findMany({
//         where: {
//             userId: req.user?.id
//         }
//     })
//     return res.json(allUserDocuments);
// })

// router.get("/documents/:id", async (req, res) => {
//     const documentId: number = Number(req.params.id);

//     const document = await prisma.document.findFirst({
//         where: {
//             userId: req.user?.id,
//             id: documentId
//         }
//     });

//     return res.json(document);
// });

// router.post("/documents", async (req, res) => {
//     const newDocument = await prisma.document.create({
//         data: {
//             documentContent: "New Document",
//             allowedUserIds: [1, 2],
//             userId: req.user?.id!
//         }
//     })

//     return res.json({ id: newDocument.id });
// })

// module.exports = router;