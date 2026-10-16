export const helloExample = `return Column()
  .padding(28)
  .gap(12)
  .bg('#0a0a0a')
  .children([
    Text('Play')
      .fontSize(48)
      .fontWeight(800)
      .letterSpacing('-0.04em')
      .textTransform('uppercase')
      .color('#ffffff'),
    Text('Edit the code. The preview follows.')
      .fontSize(14)
      .color('#9a9a9a'),
  ])`

export const buttonExample = `return Column()
  .padding(28)
  .gap(16)
  .bg('#0a0a0a')
  .children([
    Text('Button')
      .fontSize(32)
      .fontWeight(800)
      .textTransform('uppercase')
      .color('#ffffff'),
    Button('Press')
      .height(44)
      .paddingHorizontal(18)
      .bg('#ff2d8a')
      .color('#ffffff')
      .fontWeight(800)
      .letterSpacing('0.12em')
      .textTransform('uppercase')
      .onPress(() => {
        console.log('pressed')
      }),
  ])`

export const formExample = `const notes = listSignal([])

return Form()
  .padding(28)
  .gap(12)
  .bg('#0a0a0a')
  .validation({
    note: [required('Write a note'), minLength(2, 'At least 2 characters')],
  })
  .onSubmit((values) => {
    notes.add({ text: String(values.note) })
  })
  .afterSubmit((_values, form) => {
    form.reset('note')
  })
  .children([
    Text('Notes ' + notes.$length)
      .fontSize(28)
      .fontWeight(800)
      .textTransform('uppercase')
      .color('#ffffff'),
    TextField()
      .name('note')
      .placeholder('A note')
      .height(44)
      .color('#ffffff')
      .bg('transparent')
      .border('1px solid rgba(255,255,255,0.16)'),
    Button('Add')
      .submit()
      .height(44)
      .bg('#c8ff00')
      .color('#000000')
      .fontWeight(800)
      .textTransform('uppercase'),
    List()
      .items(notes)
      .renderItem((item) => Text(item.text).color('#ffffff').padding('8px 0')),
  ])`
