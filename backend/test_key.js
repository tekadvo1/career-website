const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyCQUEclUjcOWOG9rOZ1D6Qfc65OGgCKAbk');

const testModels = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-pro'
];

async function test() {
  for (const m of testModels) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('Hi');
      console.log('SUCCESS with model:', m);
      return;
    } catch (e) {
      console.log(`FAILED model: ${m} \n ==> Error: ${e.message}`);
    }
  }
}
test();
