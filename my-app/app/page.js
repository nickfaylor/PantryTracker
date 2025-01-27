"use client";
import { Box, Typography, Button, Modal, TextField } from "@mui/material";
import { Stack } from "@mui/material";
import { firestore } from './firebase';
import { collection, count } from 'firebase/firestore'
import { use, useEffect, useState } from "react";
import { getDocs, query, setDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import './styles.css';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([])

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [itemName, setItemName] = useState('')

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() })
    })
    console.log(pantryList)
    setPantry(pantryList)
  }

  useEffect(() => {
    updatePantry()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { count } = docSnap.data()
      await setDoc(docRef, { count: count + 1 })
    } else {
      await setDoc(docRef, { count: 1 })
    }
    await updatePantry()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { count } = docSnap.data()
      if (count === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { count: count - 1 })
      }
    }
    await updatePantry()
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      flexDirection={'column'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>

          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Search"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant="contained"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>

      <Box border={'1px solid black'}>
        <Box width="800px" height="100px" bgcolor={'#e07a5f'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Typography variant={'h2'} color={'black'} textAlign={'center'}>
            Pantry Items
          </Typography>
        </Box>

        <Stack width="800px" height="500px" spacing={2} overflow={'auto'} bgcolor={'white'}>
          {pantry.map(({ name, count }) => (
            <Box
              key={name}
              width="100%"
              height="100px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
              borderRadius={'50px'}
            >
              <Typography
                variant={'h3'}
                color={'black'}
                textAlign={'center'}
                fontSize={24}
              >
                {
                  //Capitalizing the first letter of each item
                  name.charAt(0).toUpperCase() + name.slice(1)
                }

              </Typography>

              <Typography variant={'h3'} color={'#333'} textAlign={'center'} fontSize={22}>
                Quantity: {count}
              </Typography>

              <Button
                variant="contained"
                onClick={() => removeItem(name)}
              >Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
      <Button variant="contained" onClick={handleOpen} className="custom-add-button">Add</Button>
    </Box>

  );
}
