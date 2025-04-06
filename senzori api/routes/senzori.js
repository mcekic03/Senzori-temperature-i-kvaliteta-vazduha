const express = require("express");
const router = express.Router();
const Senzor = require("../models/senzor")


router.post('/senzori', async (req, res) => {
    try {
        const data = req.body;
        console.log("Primljeni podaci:", data);
        const rez = await Senzor.upisPodataka(data)
        console.log(rez);
        res.status(200).json({ status: 'success', message: 'Podaci primljeni' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// Ruta za AppsLab senzor
router.post('/senzorAppsLab', async (req, res) => {
    try {
        const data = req.body;
        console.log("Primljeni podaci APPSLAB:", data);
        const rez = await Senzor.upisPodataka(data)
        console.log(rez);
        res.status(200).json({ status: 'success', message: 'Podaci primljeni' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});


router.get('/GetSenzorData', async (req, res) => {
    try {
        const UlaznaVrata = await Senzor.poslednjiUnos('16160069');
        const SamsungAppsLab = await Senzor.poslednjiUnos('9091332')
        
            //Ako postoji poslednji unos, vraćamo ga kao JSON
            res.status(200).json([UlaznaVrata,SamsungAppsLab]);
        
        
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Došlo je do greške pri dobijanju poslednjeg unosa.' });
    }
});



module.exports = router;