const express = require('express');
const fs = require('fs').promises;
const app = express();
app.use(express.json());


const PORT = 3000;

const readEmployeeFromFile = async () => {
  const data = await fs.readFile("./employees.json", "utf-8");
  return JSON.parse(data || []);
};

const writeEmployeeToFile = async (records) => {
  await fs.writeFile("./employees.json", JSON.stringify(records, null, 2));
};

app.get('/',async(req,res)=> {
  const data = await readEmployeeFromFile();
  return res.status(200).json(data);
})

app.post("/register",async(req,res)=>{
  try{
    const emp = await readEmployeeFromFile();

    const user = req.body;

    if(!user ||!user.id|| !user.name || !user.gender || !user.department || !user.Salary || !user.startdate) {
      return res.status(409).send("please provide valid information.")
    }

    const validId = emp.find(emp => emp.id === user.id) 

    if(validId) {
      return res.status(409).send("Id already Exist");
    }

    emp.push(user);
    await writeEmployeeToFile(emp);
    res.status(201).json({
      message:"Employee registered sucessfully",
      emp:user

    });
  }
  catch(error){
    res.status(500).send("server error")
  }
})

app.post("/update/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Empty body not allowed" });
    }

    const existingEmployee = await readEmployeeFromFile();

    const foundIndex = existingEmployee.findIndex((s) => s.id === userId);
    if (foundIndex === -1) {
      return res.status(404).send("Employee not found");
    }

    existingEmployee[foundIndex] = {
      ...existingEmployee[foundIndex],
      ...req.body,
    };

    await writeEmployeeToFile(existingEmployee);

    return res.status(200).json({
      message: "Updated Successfully",
      student: existingEmployee[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

app.post("/delete/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const existingEmployee = await readEmployeeFromFile();

    const foundIndex = existingEmployee.findIndex((s) => s.id === userId);
    if (foundIndex === -1) {
      return res.status(404).send("Student not found");
    }

    const deletedStudent = existingEmployee.splice(foundIndex, 1);

    await writeEmployeeToFile(existingEmployee);

    return res.status(200).json({
      message: "Student deleted successfully",
      deletedStudent: deletedStudent[0],
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

const server = app.listen(PORT,()=> {
  console.log("Server is listening on PORT 3000 ");
})  