import boto3
import os

def upload_file(file_path, bucket_name):
    """
    Upload file to S3 bucket.
    """
    try:
        s3 = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION"),
        )
        
        filename = file_path.split("/")[-1]
        s3.upload_file(file_path, bucket_name, filename)
        return f"https://{bucket_name}.s3.amazonaws.com/{filename}"
    except Exception as e:
        print(f"S3 Upload Error: {e}")
        raise
