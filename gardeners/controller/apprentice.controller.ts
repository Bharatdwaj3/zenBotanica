import prisma from "../config/prisma-client.ts";
import type { Prisma } from "@prisma/client"; type studentModel = Prisma.apprenticeGetPayload<{}>; type apprenticeCreateInput = Prisma.apprenticeCreateInput; type apprenticeUpdateInput = Prisma.apprenticeUpdateInput; 
import type { Response, Request } from 'express';

const listApprentice= async (req:Request, res:Response<any, studentModel>):Promise<void> => {
  try {
    const Apprentices = await prisma.apprentice.findMany();
    res.status(200).json(Apprentices);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
}

//get Apprentice by id
const getApprentice= async (req:Request<{id:string}>, res:Response<studentModel | null>):Promise<void> => {
  try {
    const Apprentice = await prisma.apprentice.findUnique({
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
const registerApprentice =async (req:Request<{},{}, apprenticeCreateInput>, res:Response<studentModel|null>) => {
  try {
    const Apprentice = await prisma.apprentice.create({
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
const updateApprentice=async (req:Request<{id:string},{},apprenticeUpdateInput>, res:Response<studentModel>):Promise<void> => {
  try {
    const Apprentice = await prisma.apprentice.update({
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
    const Apprentice = await prisma.apprentice.delete({
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