import prisma from "../config/prisma-client.ts";
import type { Prisma } from "@prisma/client"; type facultyModel = Prisma.facultyGetPayload<{}>; type facultyCreateInput = Prisma.facultyCreateInput; type facultyUpdateInput = Prisma.facultyUpdateInput; 
import type { Response, Request } from 'express';

const listMaster= async (req:Request, res:Response<any, facultyModel>):Promise<void> => {
  try {
    const masters = await prisma.faculty.findMany();
    res.status(200).json(masters);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
}

//get master by id
const getMaster= async (req:Request<{id:string}>, res:Response<facultyModel | null>):Promise<void> => {
  try {
    const master = await prisma.faculty.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(master);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
};

//create master
const registerMaster =async (req:Request<{},{}, facultyCreateInput>, res:Response<facultyModel|null>) => {
  try {
    const master = await prisma.faculty.create({
      data: {
        email: req.body.email,
        Fname: req.body.Fname,
        Lname: req.body.Lname,
        age: Number(req.body.age),
        gender:req.body.gender,
        Expertise: req.body.Expertise
      },
    });
    res.status(201).json(master);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
};

//update master
const updateMaster=async (req:Request<{id:string},{},facultyUpdateInput>, res:Response<facultyModel>):Promise<void> => {
  try {
    const master = await prisma.faculty.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
       email: req.body.email,
        Fname: req.body.Fname,
        Lname: req.body.Lname,
        age: Number(req.body.age),
        gender:req.body.gender,
        Expertise: req.body.Expertise
      },
    });
    res.status(200).json(master);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
};

//delete master
const removeMaster = async (req:Request<{id:string},{},facultyModel>, res:Response<facultyModel>):Promise<void> => {
  try {
    const master = await prisma.faculty.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(master);
  } catch (error) {
    res.status(500).json({ message: error.message } as any);
  }
};

export {
  listMaster,
  getMaster,
  registerMaster,
  updateMaster,
  removeMaster,
};