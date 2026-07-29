import fs from 'fs';

function unlinkImage(imagePaths: string | string[]) {
  const paths: string[] = typeof imagePaths === 'string' ? [imagePaths] : imagePaths;

  paths.forEach((imagePath) => {
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(`Error deleting the file ${imagePath}:`, err);
      } else {
        console.log(`File ${imagePath} deleted successfully`);
      }
    });
  });
}

export default unlinkImage;
