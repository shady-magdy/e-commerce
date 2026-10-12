'use strict';

require('dotenv').config({ path: require('node:path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { connectDatabase } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const categories = [
  { name: 'Ceramics', slug: 'ceramics', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80' },
  { name: 'Lighting', slug: 'lighting', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80' },
  { name: 'Textiles', slug: 'textiles', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80' },
  { name: 'Objects', slug: 'objects', image: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80' },
];
const sourceProducts = [
  ['AT-CER-01','Sculpted Stoneware Vase','A hand-finished silhouette in softly textured stoneware. Each piece carries subtle, considered variation.',58,'ceramics',['Ivory','Olive'],17,true,0,'photo-1578749556568-bc2c40e68b61'],
  ['AT-CER-02','Everyday Breakfast Bowl','A gently weighted bowl made for a slow morning and something warm.',34,'ceramics',['Sand','Ivory'],21,false,0,'photo-1610701596007-11502861dcfa'],
  ['AT-CER-03','Ripple Glaze Carafe','A softly rippled carafe with a tactile glaze and pleasingly simple lines.',68,'ceramics',['Olive','Ivory'],8,true,0,'photo-1576021182211-9ea8dced3690'],
  ['AT-CER-04','Little Pinch Pot','A useful catch-all for salt, rings, or the quiet bits of the day.',22,'ceramics',['Terracotta','Sand'],0,false,0,'photo-1490312278390-ab64016e0aa9'],
  ['AT-LGT-01','Soft Glow Table Lamp','A small, sculptural lamp with a warm linen shade and an easy glow.',180,'lighting',['Natural','Olive'],9,true,0,'photo-1507473885765-e6ed057f782c'],
  ['AT-LGT-02','Gather Pendant','An airy pendant that casts a soft pool of light above the table.',240,'lighting',['Natural','Charcoal'],6,true,0,'photo-1524484485831-a92ffc0de03f'],
  ['AT-LGT-03','Folded Paper Sconce','A pleated shade that turns a corner into its own warm little place.',125,'lighting',['Ivory'],4,false,0,'photo-1543198126-a8ad8e47fb22'],
  ['AT-TEX-01','Washed Linen Throw','Relaxed, breathable linen with a softly lived-in finish.',96,'textiles',['Natural','Olive'],12,true,15,'photo-1616486338812-3dadae4b4ace'],
  ['AT-TEX-02','The Everyday Napkin Set','Four easy linen napkins, ready for weekday lunches and long tables.',48,'textiles',['Natural','Terracotta'],18,false,0,'photo-1600210492486-724fe5c67fb0'],
  ['AT-TEX-03','Cotton Waffle Bath Towel','A soft, absorbent everyday towel with a pleasingly textured hand.',42,'textiles',['Ivory','Sage'],14,false,0,'photo-1620626011761-996317b8d101'],
  ['AT-OBJ-01','Arched Travertine Tray','Natural stone with a simple arched edge for everyday keeping.',78,'objects',['Sand'],7,true,0,'photo-1494438639946-1ebd1d20bf85'],
  ['AT-OBJ-02','Oak Catchall Dish','A palm-sized solid oak dish for keys, rings, and the things we carry.',38,'objects',['Natural'],11,false,0,'photo-1618220179428-22790b461013'],
];

async function seed() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required in .env.');
  if (process.env.ADMIN_PASSWORD.length < 16) throw new Error('ADMIN_PASSWORD must be at least 16 characters.');
  await connectDatabase();
  const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
  if (!existingAdmin) {
    await User.create({ name: 'Atelier Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin' });
    console.log(`Created administrator ${process.env.ADMIN_EMAIL}.`);
  } else if (existingAdmin.role !== 'admin') {
    existingAdmin.role = 'admin';
    await existingAdmin.save();
    console.log('Promoted the configured seed account to administrator.');
  } else {
    console.log(`Administrator ${process.env.ADMIN_EMAIL} already exists; its password was left unchanged.`);
  }
  const categoryBySlug = {};
  for (const category of categories) {
    const result = await Category.findOneAndUpdate({ slug: category.slug }, { $set: category }, { upsert: true, new: true, setDefaultsOnInsert: true });
    categoryBySlug[category.slug] = result._id;
  }
  const operations = sourceProducts.map(([sku,name,description,price,category,colors,stock,isBestSeller,discountPercent,image]) => ({
    updateOne: {
      filter: { sku },
      update: { $set: { sku, name, description, price, category: categoryBySlug[category], colors, stock, isAvailable: stock > 0, isDiscounted: discountPercent > 0, discountPercent, isBestSeller, images: [`https://images.unsplash.com/${image}?auto=format&fit=crop&w=1000&q=85`] } },
      upsert: true,
    },
  }));
  const result = await Product.bulkWrite(operations, { ordered: false });
  console.log(`Seeded ${categories.length} categories and ${result.upsertedCount + result.modifiedCount} sample products.`);
}
seed().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect().catch(() => {}); });
