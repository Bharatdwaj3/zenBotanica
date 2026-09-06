import prisma from "../config/prisma-client.ts";
import type { Prisma } from "@prisma/client"; type studentModel = Prisma.studentGetPayload<{}>; type studentCreateInput = Prisma.studentCreateInput; type studentUpdateInput = Prisma.studentUpdateInput; 
import type { Response, Request } from 'express';

const listApprentice= async (req:Request, res:Response<any, studentModel>):Promise<void> => {
  try {
    const Apprentices = await prisma.student.findMany();
    res.status(200).json(Apprentices);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
}

//get Apprentice by id
const getApprentice= async (req:Request<{id:string}>, res:Response<studentModel | null>):Promise<void> => {
  try {
    const Apprentice = await prisma.student.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(Apprentice);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
};

//create Apprentice
const registerApprentice =async (req:Request<{},{}, studentCreateInput>, res:Response<studentModel|null>) => {
  try {
    const Apprentice = await prisma.student.create({
      data: {
        email: req.body.email,
        Fname: req.body.Fname,
        Lname: req.body.Lname,
        age: Number(req.body.age),
        gender:req.body.gender,
        Subjects: req.body.Subjects
      },
    });
    res.status(201).json(Apprentice);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
};

//update Apprentice
const updateApprentice=async (req:Request<{id:string},{},studentUpdateInput>, res:Response<studentModel>):Promise<void> => {
  try {
    const Apprentice = await prisma.student.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
       email: req.body.email,
        Fname: req.body.Fname,
        Lname: req.body.Lname,
        age: Number(req.body.age),
        gender:req.body.gender,
        Subjects: req.body.Subjects
      },
    });
    res.status(200).json(Apprentice);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
};

//delete Apprentice
const removeApprentice = async (req:Request<{id:string},{},studentModel>, res:Response<studentModel>):Promise<void> => {
  try {
    const Apprentice = await prisma.student.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(Apprentice);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
};

export {
  listApprentice,
  getApprentice,
  registerApprentice,
  updateApprentice,
  removeApprentice,
};