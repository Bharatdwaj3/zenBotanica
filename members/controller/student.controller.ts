import prisma from "../config/prisma-client.ts";
import type {studentCreateInput, studentModel, studentUpdateInput } from "../generated/prisma/models/student.ts" 
import type { Response, Request } from 'express';

const listStudent= async (req:Request, res:Response<any, studentModel>):Promise<void> => {
  try {
    const Students = await prisma.student.findMany();
    res.status(200).json(Students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//get Student by id
const getStudent= async (req:Request<{id:string}>, res:Response<studentModel | null>):Promise<void> => {
  try {
    const Student = await prisma.student.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(Student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//create Student
const registerStudent =async (req:Request<{},{}, studentCreateInput>, res:Response<studentModel|null>) => {
  try {
    const Student = await prisma.student.create({
      data: {
        email: req.body.email,
        Fname: req.body.Fname,
        Lname: req.body.Lname,
        age: Number(req.body.age),
        gender:req.body.gender,
        Subjects: req.body.Subjects
      },
    });
    res.status(201).json(Student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update Student
const updateStudent=async (req:Request<{id:String},{},studentUpdateInput>, res:Response<studentModel>):Promise<void> => {
  try {
    const Student = await prisma.student.update({
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
    res.status(200).json(Student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete Student
const removeStudent = async (req:Request<{id:string},{},studentModel>, res:Response<studentModel>):Promise<void> => {
  try {
    const Student = await prisma.student.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(Student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  listStudent,
  getStudent,
  registerStudent,
  updateStudent,
  removeStudent,
};