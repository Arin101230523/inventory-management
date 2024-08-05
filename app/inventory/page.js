'use client';

import { useState, useEffect } from "react";
import { firestore } from '@/firebase';
import { Box, Typography, Modal, Stack, TextField, Button } from '@mui/material';
import { collection, getDocs, query, getDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { CiEdit, CiSearch } from "react-icons/ci";
import { FcAlphabeticalSortingAz, FcAlphabeticalSortingZa } from "react-icons/fc";
import { UserAuth } from '../context/AuthContext';


export default function Home() {
  const { user } = UserAuth();
  if(!user) { return <div>Not logged in</div> }
  
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [sortingOrder, setSortingOrder] = useState('default'); // 'default', 'asc', or 'desc'

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      });
    });
    setInventory(inventoryList);
  }

  const addItem = async (item, quantity = 1) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      await setDoc(docRef, { quantity: data.quantity + quantity });
    } else {
      await setDoc(docRef, { quantity });
    }

    await updateInventory();
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory();
  }

  const modifyItem = async (oldName, newName, newQuantity) => {
    const oldDocRef = doc(collection(firestore, 'inventory'), oldName);
    const newDocRef = doc(collection(firestore, 'inventory'), newName);
    const oldDocSnap = await getDoc(oldDocRef);

    if (oldDocSnap.exists()) {
      const data = oldDocSnap.data();
      await setDoc(newDocRef, { quantity: newQuantity });
      if (oldName !== newName) {
        await deleteDoc(oldDocRef);
      }
      await updateInventory();
    }
  }

  useEffect(() => {
    updateInventory();
  }, [])

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentItem(null);
    setItemName('');
    setItemQuantity('');
    setError('');
  }
  
  const handleSearchOpen = () => setSearchOpen(true);
  const handleSearchClose = () => setSearchOpen(false);

  const handleSearchClear = () => setSearchQuery('');

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setItemName(item.name);
    setItemQuantity(item.quantity);
    setOpen(true);
  }

  const handleSave = async () => {
    if (!itemName || !itemQuantity) {
      setError('Both fields are required.');
      return;
    }

    setError('');

    if (currentItem) {
      await modifyItem(currentItem.name, itemName, Number(itemQuantity));
    } else {
      await addItem(itemName, Number(itemQuantity));
    }
    handleClose();
  }

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSortToggle = () => {
    setSortingOrder((prevOrder) => {
      if (prevOrder === 'default') return 'asc';
      if (prevOrder === 'asc') return 'desc';
      return 'default'; // 'desc' goes back to 'default'
    });
  }

  const sortedInventory = filteredInventory.sort((a, b) => {
    if (sortingOrder === 'default') {
      return 0; // no sorting
    }
    if (sortingOrder === 'asc') {
      return a.name.localeCompare(b.name);
    }
    return b.name.localeCompare(a.name);
  });

  return (
    <Box
      width='100vw'
      height='100vh'
      display='flex'
      flexDirection='column'
      alignItems='center'
      gap={2}
      padding={2}
    >
      <CiSearch size={25} onClick={handleSearchOpen} style={{ cursor: 'pointer' }} />
      <Modal open={searchOpen} onClose={handleSearchClose}>
        <Box
          position='absolute'
          top='50%'
          left='50%'
          sx={{ transform: 'translate(-50%,-50%)' }}
          width={{ xs: '90%', sm: 400 }}
          bgcolor='white'
          border='2px solid #000'
          boxShadow={24}
          p={4}
          display='flex'
          flexDirection='column'
          gap={3}
        >
          <Typography variant='h6'>Search Inventory</Typography>
          <TextField 
            variant='outlined' 
            fullWidth 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder='Enter item name'
          />
          <Stack direction='row' spacing={2}>
            <Button variant='outlined' onClick={handleSearchClear}>
              Clear
            </Button>
            <Button variant='outlined' onClick={handleSearchClose}>
              Close
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal open={open} onClose={handleClose}>
        <Box
          position='absolute'
          top='50%'
          left='50%'
          sx={{ transform: 'translate(-50%,-50%)' }}
          width={{ xs: '90%', sm: 400 }}
          bgcolor='white'
          border='2px solid #000'
          boxShadow={24}
          p={4}
          display='flex'
          flexDirection='column'
          gap={3}
        >
          <Typography variant='h6'>{currentItem ? 'Edit Item' : 'Add Item'}</Typography>
          <Stack width='100%' spacing={2} direction='column'>
            <TextField 
              variant='outlined' 
              fullWidth 
              value={itemName} 
              onChange={(e) => setItemName(e.target.value)} 
              placeholder='Item Name'
            />
            <TextField 
              variant='outlined' 
              fullWidth 
              type='number' 
              value={itemQuantity} 
              onChange={(e) => setItemQuantity(e.target.value)} 
              placeholder='Quantity'
            />
            <Button variant='contained' onClick={handleSave}>
              {currentItem ? 'Save' : 'Add'}
            </Button>
          </Stack>
          {error && <Typography color='error'>{error}</Typography>}
        </Box>
      </Modal>
      <Button variant='contained' onClick={handleOpen}>
        ADD NEW ITEM
      </Button>
      <Box border='1px solid #333' width='100%' maxWidth='800px' position='relative'>
        <Box
          width='100%'
          height='100px'
          bgcolor='#ADD8E6'
          display='flex'
          alignItems='center'
          justifyContent='center'
          position='relative'
        >
          <Box
            position='absolute'
            top={10}
            left={10}
            display='flex'
            alignItems='center'
          >
            <Button 
              onClick={handleSortToggle} 
              style={{
                backgroundColor: sortingOrder !== 'default' ? '#e0e0e0' : 'transparent', // Highlight if active
                borderColor: sortingOrder !== 'default' ? '#333' : '#ccc',
                borderWidth: '2px',
                borderStyle: 'solid',
                marginRight: '8px'
              }}
            >
              {sortingOrder === 'asc' ? (
                <FcAlphabeticalSortingAz size={30} style={{ cursor: 'pointer' }} />
              ) : sortingOrder === 'desc' ? (
                <FcAlphabeticalSortingZa size={30} style={{ cursor: 'pointer' }} />
              ) : (
                <Box size={30} style={{ cursor: 'pointer' }} >Sort</Box>
              )}
            </Button>
          </Box>
          <Typography variant='h2' color='#333'>
            Inventory Items
          </Typography>
        </Box>
        <Stack width='100%' height='300px' spacing={2} overflow='auto'>
          {sortedInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width='100%'
              minHeight='150px'
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              bgcolor='#f0f0f0'
              padding={2}
              sx={{ flexWrap: 'wrap' }}
            >
              <Typography variant='h3' color='#333' textAlign='center'>
                {name.charAt(0).toUpperCase() + name.slice(1)}
                <CiEdit onClick={() => handleEditClick({ name, quantity })} size={30} style={{ cursor: 'pointer', marginLeft: '8px' }} />
              </Typography>
              <Stack direction='row' alignItems='center' spacing={2}>
                <Typography variant='h3' color='#333' textAlign='center'>{quantity}</Typography>
              </Stack>
              <Stack direction='row' spacing={2}>
                <Button variant='contained' onClick={() => addItem(name)}>+</Button>
                <Button variant='contained' onClick={() => removeItem(name)}>-</Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );  
}  
