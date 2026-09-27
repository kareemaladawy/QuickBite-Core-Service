import { Router } from "express";
import { pingDB } from "../../common/knex/knex.js";

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
    try {
        await pingDB();

        return res.status(200).send('Ok');
    } catch (error) {
        return res.status(500).send('DB Down');
    }
})