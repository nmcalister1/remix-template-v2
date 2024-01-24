import { UploadHandler, unstable_parseMultipartFormData } from "@remix-run/node"
import { S3Client} from '@aws-sdk/client-s3'
import cuid from "cuid"
import {Readable} from 'stream'
import { Upload } from "@aws-sdk/lib-storage"

process.env.AWS_ACCESS_KEY_ID = process.env.ACCESS_KEY
process.env.AWS_SECRET_ACCESS_KEY = process.env.SECRET_KEY

const s3Client = new S3Client({region: process.env.BUCKET_REGION})

const uploadProfilePictureToBucket = async ({bucketName, folderPath, fileName, fileContent}: 
    { bucketName: string; folderPath: string; fileName: string; fileContent: Readable; }) => {
    try {
      const uniqueKey = `${cuid()}.${folderPath}/${fileName}`
      console.log(`Uploading profile picture ${fileName}\n`);

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: bucketName,
          Key: uniqueKey,
          Body: fileContent,
        },
      });
  
      // Perform the upload
      await upload.done();
      const objectUrl = `https://${bucketName}.s3.amazonaws.com/${uniqueKey}`
      return objectUrl
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

const uploadHandler: UploadHandler = async({ name, filename, data }) => {
    const stream = Readable.from(data)
    if (name !== "profile-pic"){
        stream.resume()
        return
    }
    
    
    const fileContent = stream
    const bucketName = process.env.BUCKET_NAME
    if (bucketName && filename) {
        const folderPath = "profiles";
        const fileName = encodeURIComponent(filename)

        try {
            // Assume you have an asynchronous function that uploads to the S3 bucket
            const uploadedFileUrl = await uploadProfilePictureToBucket({
                bucketName,
                folderPath,
                fileName,
                fileContent,
            });

            // Ensure that uploadedFileUrl is a string or return null
            return uploadedFileUrl
        } catch (e) {
            console.error('Error uploading profile picture:', e);
            return null;
        }
    } else {
        console.error('Bucket name or filename is undefined.');
        return null;
    }
}


export async function uploadAvatar(request: Request){
    try {
        const formData = await unstable_parseMultipartFormData(request, uploadHandler);
        const file = formData.get("profile-pic")
        // Return the URL of the uploaded file
        return file
      } catch (error) {
        console.error('Error uploading avatar:', error);
        // Handle error appropriately, you might want to return an error response
        return { error: 'Failed to upload avatar' };
      }
}