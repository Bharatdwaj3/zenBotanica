import prisma from "../config/prisma-client.ts";
import type {masterCreateInput, masterModel, masterUpdateInput } from "../generated/prisma/models/master.ts" 
import type { Response, Request } from 'express';

const listMaster= async (req:Request, res:Response<any, masterModel>):Promise<void> => {
  try {
    const masters = await prisma.master.findMany();
    res.status(200).json(masters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//get master by id
const getMaster= async (req:Request<{id:string}>, res:Response<masterModel | null>):Promise<void> => {
  try {
    const master = await prisma.master.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(master);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//create master
const registerMaster =async (req:Request<{},{}, masterCreateInput>, res:Response<masterModel|null>) => {
  try {
    const master = await prisma.master.create({
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
    res.status(500).json({ message: error.message });
  }
};

//update master
const updateMaster=async (req:Request<{id:String},{},masterUpdateInput>, res:Response<masterModel>):Promise<void> => {
  try {
    const master = await prisma.master.update({
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
    res.status(500).json({ message: error.message });
  }
};

//delete master
const removeMaster = async (req:Request<{id:string},{},masterModel>, res:Response<masterModel>):Promise<void> => {
  try {
    const master = await prisma.master.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(master);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  listMaster,
  getMaster,
  registerMaster,
  updateMaster,
  removeMaster,
};