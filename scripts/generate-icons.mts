#!/usr/bin/env node
/**
 * FossilHunters – generate-icons.mts
 *
 * Generates public/icon-192.png and public/icon-512.png
 * using only Node.js built-ins + the Canvas API (via the
 * @napi-rs/canvas package which ships pre-built binaries).
 *
 * Run: npx tsx scripts/generate-icons.mts
 *
 * If you'd rather supply your own PNG files just drop them into
 * public/ and skip this script.
 */

import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC = join(process.cwd(), 'public');
mkdirSync(PUBLIC, { recursive: true });

function drawIcon(size: number): Buffer {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size;

  // Background circle – deep purple
  ctx.fillStyle = '#2d1b3d';
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  ctx.fill();

  // Inner amber ring
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = s * 0.04;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s * 0.44, 0, Math.PI * 2);
  ctx.stroke();

  // Bone / fossil X shape (simple cross + rotated)
  const drawBone = (cx: number, cy: number, len: number, angle: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = s * 0.07;
    ctx.lineCap = 'round';
    // shaft
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.lineTo(len / 2, 0);
    ctx.stroke();
    // end knobs
    [(-len / 2), (len / 2)].forEach(x => {
      ctx.beginPath();
      ctx.arc(x, 0, s * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
    });
    ctx.restore();
  };

  drawBone(s / 2, s / 2, s * 0.52, Math.PI / 4);
  drawBone(s / 2, s / 2, s * 0.52, -Math.PI / 4);

  // Small amber dot in center
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s * 0.07, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

writeFileSync(join(PUBLIC, 'icon-192.png'), drawIcon(192));
writeFileSync(join(PUBLIC, 'icon-512.png'), drawIcon(512));

console.log('✅  public/icon-192.png and public/icon-512.png generated!');
