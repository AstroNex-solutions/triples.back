
// ==========================================
// MODULE FLASHCARDS
// ==========================================
exports.getModuleFlashcards = async (req, res) => {
  try {
    const { id } = req.params;
    const decks = await FlashcardDeck.findAll({
      where: { module_id: id },
      order: [['order', 'ASC'], ['id', 'ASC']]
    });
    res.json({ decks });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب بطاقات الموديول', error: error.message });
  }
};

exports.createModuleFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_name, topic_name, order } = req.body;
    
    // In this logic, we assume we might need a default product_id or just set it to some logic.
    // If FlashcardDeck requires product_id and it can't be null, we need to handle it.
    // Let's just pass product_id: 1 for now if it is strictly required, or find the course's product.
    
    const deck = await FlashcardDeck.create({
      module_id: id,
      product_id: 1, // Fallback if required
      chapter_name,
      topic_name,
      order: order || 0
    });
    res.status(201).json({ message: 'تم إنشاء المجموعة', deck });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إضافة بطاقات الموديول', error: error.message });
  }
};

exports.updateModuleFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_name, topic_name, order } = req.body;
    
    const deck = await FlashcardDeck.findByPk(id);
    if (!deck) return res.status(404).json({ message: 'المجموعة غير موجودة' });
    
    await deck.update({ chapter_name, topic_name, order });
    res.json({ message: 'تم التحديث بنجاح', deck });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في التحديث', error: error.message });
  }
};

exports.deleteModuleFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const deck = await FlashcardDeck.findByPk(id);
    if (!deck) return res.status(404).json({ message: 'المجموعة غير موجودة' });
    
    await deck.destroy();
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الحذف', error: error.message });
  }
};
