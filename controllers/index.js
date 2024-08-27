const express = require('express');
const router = express.Router();
const places = require('../models/schema.js');

// Add City API
router.post('/create', async (req, res) => {
  try {
    const city = new places(req.body);
    await city.save();
    res.json({ message: 'City added successfully', city });
  } catch (error) { 
    if (error.code === 11000) {
      res.status(400).json({ message: 'City name already exists' });
    } else {
      res.status(400).json({ message: 'Error adding city' });
    }
  }
});

// Update City API
router.put('/update/:id', async (req, res) => {

  try {
    const id=req.params.id
    const cityExist=await places.findOne({_id:id})
    if (!cityExist){
        return res.status(404).json({ message: 'City not found' });
    }
    const updateCity = await places.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ message: 'City updated successfully', updateCity });
  } catch (error) {
    res.status(500).json({error:"Internal server error"});
  }
});

// Delete City API
router.delete('/delete/:id', async (req, res) => {

  try {
    const id=req.params.id
    const cityExist=await places.findOne({_id:id})
    if (!cityExist){
        return res.status(404).json({ message: 'City not found' });
    }
    await places.findByIdAndDelete(id);
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    res.status(500).json({error:"Internal server error"});
  }
});

// Get Cities API
router.get('/', async (req, res) => {
    try {
        const {
          page = 1,       // Pagination - page number
          limit = 10,     // Pagination - limit per page
          filter,         // Filter criteria (e.g., {"country": "USA"})
          sort,           // Sorting field and order (e.g., 'population' or '-population')
          search,         // Search term (e.g., 'New')
          projection,     // Fields to include/exclude (e.g., 'name country')
        } = req.query;
    
        // Convert filter from string to object
        let filterCriteria = {};
        if (filter) {
          filterCriteria = JSON.parse(filter);
        }
    
        // Handle search on the city name
        if (search) {
          filterCriteria.name = { $regex: search, $options: 'i' };
        }
    
        // Handle pagination
        const skip = (page - 1) * limit;
    
        // Handle sorting
        let sortCriteria = {};
        if (sort) {
          const [field, order] = sort.startsWith('-') ? [sort.substring(1), -1] : [sort, 1];
          sortCriteria[field] = order;
        }
    
        // Fetch cities from the database
        const cities = await places.find(filterCriteria)
          .select(projection)     // Handle projection
          .sort(sortCriteria)     // Handle sorting
          .skip(skip)             // Handle pagination
          .limit(parseInt(limit)) // Handle pagination limit
    
        // Get the total count for pagination
        const totalCities = await places.countDocuments(filterCriteria);
    
        res.json({
          cities,
          totalCities,
          totalPages: Math.ceil(totalCities / limit),
          currentPage: parseInt(page),
        });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
});

module.exports = router;