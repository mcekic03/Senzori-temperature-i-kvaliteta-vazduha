const express = require("express");
const router = express.Router();
const Senzor = require("../models/senzor")

//odsek nis ruta
router.post('/senzori', async (req, res) => {
    try {
        const data = req.body;
        console.log("Primljeni podaci odsek Nis:", data);
        const rez = await Senzor.upisPodataka(data)
        console.log(rez);
        res.status(200).json({ status: 'success', message: 'Podaci primljeni' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// Ruta za AppsLab senzor odnosno odsekPirot
router.post('/senzorAppsLab', async (req, res) => {
    try {
        const data = req.body;
        console.log("Primljeni podaci odsek Pirot", data);
        const rez = await Senzor.upisPodataka(data)
        console.log(rez);
        res.status(200).json({ status: 'success', message: 'Podaci primljeni' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});


router.get('/GetSenzorData', async (req, res) => {
    try {
        const ATVSSOdsekNis = await Senzor.poslednjiUnos('16160069');
        const SamsungAppsLab = await Senzor.poslednjiUnos('9091332');
        const ATVSSOdsekVranje = await Senzor.poslednjiUnos('15139426');

        const poruka = await Senzor.procenti();
            //Ako postoji poslednji unos, vraćamo ga kao JSON
            res.status(200).json([ATVSSOdsekNis,SamsungAppsLab, poruka,ATVSSOdsekVranje]);
        
        
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Došlo je do greške pri dobijanju poslednjeg unosa.' });
    }
});

//odsek vranje ruta
router.post('/odsekVranje', async (req, res) => {
    try {
        console.log("proba");
        const data = req.body;
        console.log("Primljeni podaci od odsek Vranje:", data);
        const rez = await Senzor.upisPodataka(data)
        console.log(rez);
        res.status(200).json({ status: 'success', message: 'Podaci primljeni' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});




module.exports = router;