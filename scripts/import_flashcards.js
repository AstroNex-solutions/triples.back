const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { sequelize, FlashcardProduct, FlashcardDeck, FlashcardItem } = require('../models');

async function importFlashcards() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    await sequelize.sync(); // Ensure tables are created

    const fcPath = path.join(__dirname, '../../FC.1');
    const items = fs.readdirSync(fcPath);

    // Create one main Product for all imported flashcards for now
    let product = await FlashcardProduct.findOne({ where: { title: 'USMLE Flashcards - All Chapters' } });
    if (!product) {
      product = await FlashcardProduct.create({
        title: 'USMLE Flashcards - All Chapters',
        description: 'Complete Flashcard collection imported from FC.1',
        price: 50.00,
        is_active: true
      });
    }

    let deckOrder = 1;
    let cardOrder = 1;

    for (const item of items) {
      const chapterPath = path.join(fcPath, item);
      if (fs.statSync(chapterPath).isDirectory() && item.includes('Chapter')) {
        const chapterName = item;
        console.log(`Processing chapter: ${chapterName}`);

        const topicFiles = fs.readdirSync(chapterPath);
        for (const topicFile of topicFiles) {
          if (topicFile.endsWith('.xlsx')) {
            const topicName = topicFile.replace('.xlsx', '');
            console.log(`  Processing topic: ${topicName}`);

            const topicPath = path.join(chapterPath, topicFile);
            const workbook = xlsx.readFile(topicPath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }); // read as array of arrays

            if (data.length === 0) continue;

            // Create Deck for this Topic
            const deck = await FlashcardDeck.create({
              product_id: product.id,
              chapter_name: chapterName,
              topic_name: topicName,
              order: deckOrder++
            });

            // Headers might be something like Front, Back, or Question, Answer
            // We'll skip the first row assuming it's headers
            let skipHeader = true;

            const cardsToInsert = [];
            for (const row of data) {
              if (skipHeader) { skipHeader = false; continue; }
              if (row.length < 2) continue; // skip empty or malformed rows

              const front = row[0]?.toString()?.trim();
              const back = row[1]?.toString()?.trim();
              const imageUrl = row[2]?.toString()?.trim() || null; // if image column exists

              if (front && back) {
                cardsToInsert.push({
                  deck_id: deck.id,
                  front_text: front,
                  back_text: back,
                  image_url: imageUrl,
                  order: cardOrder++
                });
              }
            }

            if (cardsToInsert.length > 0) {
              await FlashcardItem.bulkCreate(cardsToInsert);
              console.log(`    Inserted ${cardsToInsert.length} cards`);
            }
          }
        }
      }
    }

    console.log('Import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error importing flashcards:', error);
    process.exit(1);
  }
}

importFlashcards();
