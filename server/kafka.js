const { Kafka, logLevel } = require('kafkajs');
const { pool } = require('./db');

const KAFKA_BROKER = '118.190.201.228:9092';
const KAFKA_TOPIC = 'emails';

const kafka = new Kafka({
  clientId: 'emsg',
  brokers: [KAFKA_BROKER],
  logLevel: logLevel.NOTHING,
  retry: { retries: 2, initialRetryTime: 1000 },
});

let kafkaReady = false;
let producer = null;
let consumer = null;

async function initKafka() {
  try {
    producer = kafka.producer();
    await producer.connect();

    consumer = kafka.consumer({
      groupId: 'emsg-group',
      retry: { retries: 2, initialRetryTime: 1000 },
    });
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ message }) => {
        const data = JSON.parse(message.value.toString());
        await pool.execute(
          'INSERT INTO emails (sender_phone, receiver_phone, content, attachment) VALUES (?, ?, ?, ?)',
          [data.senderPhone, data.receiverPhone, data.content, data.attachment || null]
        );
      },
    });
    kafkaReady = true;
    console.log('Kafka connected to', KAFKA_BROKER);
  } catch (err) {
    console.warn('Kafka unavailable (' + err.message + '), using direct DB insert fallback');
    try { if (producer) await producer.disconnect(); } catch (_) {}
    try { if (consumer) await consumer.disconnect(); } catch (_) {}
    producer = null;
    consumer = null;
  }
}

async function sendEmailMessage(data) {
  if (kafkaReady && producer) {
    try {
      await producer.send({
        topic: KAFKA_TOPIC,
        messages: [{ value: JSON.stringify(data) }],
      });
      return;
    } catch (err) {
      console.warn('Kafka send failed, falling back to direct DB insert');
      kafkaReady = false;
      try { await producer.disconnect(); } catch (_) {}
      producer = null;
    }
  }
  await pool.execute(
    'INSERT INTO emails (sender_phone, receiver_phone, content, attachment) VALUES (?, ?, ?, ?)',
    [data.senderPhone, data.receiverPhone, data.content, data.attachment || null]
  );
}

module.exports = { initKafka, sendEmailMessage };
