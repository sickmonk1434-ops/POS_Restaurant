import * as dotenv from "dotenv";
dotenv.config();

import { db } from "./src/lib/db";
import { categories, menuItems } from "./src/lib/schema";

async function seedMenu() {
    console.log("Seeding menu categories and items...");

    try {
        const menuData = [
            {
                category: "STARTERS",
                items: [
                    { name: "Chicken 65", price: 140 },
                    { name: "Chicken Lollipop (4pcs)", price: 140 },
                    { name: "Chicken Chilli", price: 140 },
                    { name: "Veg Nuggets", price: 130 },
                    { name: "French Fries", price: 120 },
                ],
            },
            {
                category: "MINI MANDI",
                items: [
                    { name: "Chicken Mandi", price: 150 },
                    { name: "Fish Mandi", price: 160 },
                    { name: "Paneer Mandi", price: 150 },
                ],
            },
            {
                category: "CHICKEN MANDI",
                items: [
                    { name: "Chicken Fry Mandi (1Pc)", price: 250 },
                    { name: "Chicken Fry Mandi (2Pc)", price: 460 },
                    { name: "Chicken Fry Mandi (3Pc)", price: 620 },
                    { name: "Chicken Fry Mandi (4Pc)", price: 800 },
                    { name: "Chicken Broasted Mandi (1Pc)", price: 270 },
                    { name: "Chicken Broasted Mandi (2Pc)", price: 520 },
                    { name: "Chicken Broasted Mandi (3Pc)", price: 660 },
                    { name: "Chicken Broasted Mandi (4Pc)", price: 880 },
                    { name: "Chicken Al-Faham Mandi (1Pc)", price: 270 },
                    { name: "Chicken Al-Faham Mandi (2Pc)", price: 520 },
                    { name: "Chicken Al-Faham Mandi (3Pc)", price: 660 },
                    { name: "Chicken Al-Faham Mandi (4Pc)", price: 880 },
                    { name: "Chicken Juicy Mandi (1Pc)", price: 290 },
                    { name: "Chicken Juicy Mandi (2Pc)", price: 580 },
                    { name: "Chicken Juicy Mandi (3Pc)", price: 720 },
                    { name: "Chicken Juicy Mandi (4Pc)", price: 900 },
                    { name: "Chicken Lollipop Mandi (1Pc)", price: 290 },
                    { name: "Chicken Lollipop Mandi (2Pc)", price: 520 },
                    { name: "Chicken Lollipop Mandi (3Pc)", price: 660 },
                    { name: "Chicken Lollipop Mandi (4Pc)", price: 880 },
                ],
            },
            {
                category: "MUTTON MANDI",
                items: [
                    { name: "Mutton Fry Mandi (1Pc)", price: 280 },
                    { name: "Mutton Fry Mandi (2Pc)", price: 530 },
                    { name: "Mutton Fry Mandi (3Pc)", price: 730 },
                    { name: "Mutton Fry Mandi (4Pc)", price: 900 },
                    { name: "Mutton Juicy Mandi (1Pc)", price: 320 },
                    { name: "Mutton Juicy Mandi (2Pc)", price: 600 },
                    { name: "Mutton Juicy Mandi (3Pc)", price: 780 },
                    { name: "Mutton Juicy Mandi (4Pc)", price: 960 },
                    { name: "Mutton Ghee Roast Mandi (1Pc)", price: 370 },
                    { name: "Mutton Ghee Roast Mandi (2Pc)", price: 640 },
                    { name: "Mutton Ghee Roast Mandi (3Pc)", price: 900 },
                    { name: "Mutton Ghee Roast Mandi (4Pc)", price: 1060 },
                ],
            },
            {
                category: "FISH MANDI",
                items: [
                    { name: "Fish Fry Mandi (1Pc)", price: 280 },
                    { name: "Fish Fry Mandi (2Pc)", price: 500 },
                    { name: "Fish Fry Mandi (3Pc)", price: 700 },
                    { name: "Fish Fry Mandi (4Pc)", price: 860 },
                    { name: "Fish Brosted Mandi (1Pc)", price: 300 },
                    { name: "Fish Brosted Mandi (2Pc)", price: 520 },
                    { name: "Fish Brosted Mandi (3Pc)", price: 720 },
                    { name: "Fish Brosted Mandi (4Pc)", price: 880 },
                ],
            },
            {
                category: "EGG MANDI",
                items: [
                    { name: "Egg Mandi (1Pc)", price: 240 },
                    { name: "Egg Mandi (2Pc)", price: 460 },
                    { name: "Egg Mandi (3Pc)", price: 600 },
                    { name: "Egg Mandi (4Pc)", price: 730 },
                ],
            },
            {
                category: "VEG MANDI",
                items: [
                    { name: "Paneer Mandi (1Pc)", price: 240 },
                    { name: "Paneer Mandi (2Pc)", price: 460 },
                    { name: "Paneer Mandi (3Pc)", price: 600 },
                    { name: "Paneer Mandi (4Pc)", price: 730 },
                    { name: "Paneer 65 Mandi (1Pc)", price: 260 },
                    { name: "Paneer 65 Mandi (2Pc)", price: 480 },
                    { name: "Paneer 65 Mandi (3Pc)", price: 620 },
                    { name: "Paneer 65 Mandi (4Pc)", price: 750 },
                ],
            },
            {
                category: "EXTRAS",
                items: [
                    { name: "Chicken Piece", price: 150 },
                    { name: "Chicken Al-Faham Piece", price: 190 },
                    { name: "Chicken Brosted Piece", price: 180 },
                    { name: "Chicken Juicy Piece", price: 200 },
                    { name: "Mutton Fry Piece", price: 190 },
                    { name: "Juicy Mutton Piece", price: 210 },
                    { name: "Ghee Roast Mutton Piece", price: 250 },
                    { name: "Fish Fry Piece", price: 200 },
                    { name: "Fish Brosted Piece", price: 220 },
                    { name: "Paneer Piece", price: 140 },
                    { name: "Paneer 65 Piece", price: 180 },
                    { name: "Rice", price: 130 },
                    { name: "Fried Onion", price: 20 },
                    { name: "Mayonnaise", price: 20 },
                    { name: "Dry Fruit", price: 30 },
                    { name: "Mutton Juicy Gravy", price: 40 },
                    { name: "Mutton Ghee Roast Gravy", price: 60 },
                    { name: "Soup", price: 40 },
                ],
            },
            {
                category: "DESERTS",
                items: [
                    { name: "Kadhu Ka Kheer", price: 40 },
                ],
            },
        ];

        for (const cat of menuData) {
            console.log(`Inserting category: ${cat.category}`);
            const [newCategory] = await db
                .insert(categories)
                .values({ name: cat.category })
                .returning();

            if (newCategory) {
                const itemsToInsert = cat.items.map((item) => ({
                    name: item.name,
                    price: item.price,
                    categoryId: newCategory.id,
                }));
                await db.insert(menuItems).values(itemsToInsert);
            }
        }

        console.log("Menu seeding complete.");
    } catch (error) {
        console.error("Error seeding menu:", error);
    }
}

seedMenu();
