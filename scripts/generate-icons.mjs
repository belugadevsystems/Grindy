import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import fs from 'fs'
import path from 'path'

const src = path.resolve('assets/icon.png')
const outDir = path.resolve('assets')

async function main() {
  // Generate multiple PNG sizes for electron-builder
  const sizes = [16, 32, 48, 64, 128, 256, 512]
  for (const size of sizes) {
    await sharp(src)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`))
    console.log(`  ✓ icon-${size}.png`)
  }

  // Generate 256x256 PNG for ICO conversion
  const png256 = await sharp(src)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  
  // Write temp file for png-to-ico
  const tmpPath = path.join(outDir, '_tmp256.png')
  fs.writeFileSync(tmpPath, png256)
  
  const ico = await pngToIco(tmpPath)
  fs.writeFileSync(path.join(outDir, 'icon.ico'), ico)
  fs.unlinkSync(tmpPath)
  console.log('  ✓ icon.ico')

  console.log('Done!')
}

main().catch(console.error)
