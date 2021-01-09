import express from 'express';
const router = express.Router();

// submit logout
router.post('/', (req, res) => {
    res
        .status(200)
        .clearCookie('jwt', {
            path: '/'
        })
        .redirect('/');
});


export { router };