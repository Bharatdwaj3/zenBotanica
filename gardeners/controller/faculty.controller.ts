import prisma from "../config/prisma-client.ts";
import type {facultyCreateInput, facultyModel, facultyUpdateInput } from "../generated/prisma/models/faculty.ts" 
import type { Response, Request } from 'express';

const listFaculty= async (req:Request, res:Response<any, facultyModel>):Promise<void> => {
  try {
    const facultys = await prisma.faculty.findMany();
    res.status(200).json(facultys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//get faculty by id
const getFaculty= async (req:Request<{id:string}>, res:Response<facultyModel | null>):Promise<void> => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//create faculty
const registerFaculty =async (req:Request<{},{}, facultyCreateInput>, res:Response<facultyModel|null>) => {
  try {
    const faculty = await prisma.faculty.create({
      data: {
        email: req.body.email,
        Fname: req.body.Fname,
        Lname: req.body.Lname,
        age: Number(req.body.age),
        gender:req.body.gender,
        Expertise: req.body.Expertise
      },
    });
    res.status(201).json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update faculty
const updateFaculty=async (req:Request<{id:String},{},facultyUpdateInput>, res:Response<facultyModel>):Promise<void> => {
  try {
    const faculty = await prisma.faculty.update({
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
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete faculty
const removeFaculty = async (req:Request<{id:string},{},facultyModel>, res:Response<facultyModel>):Promise<void> => {
  try {
    const faculty = await prisma.faculty.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  listFaculty,
  getFaculty,
  registerFaculty,
  updateFaculty,
  removeFaculty,
};