import fetch from 'node-fetch';

async function seed() {
  try {
    const res = await fetch('http://localhost:3000/api/seed-products', { method: 'POST' });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

seed();
