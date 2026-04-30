import { createClient } from './client';

export async function uploadImage(file: File, folder: string = 'misc'): Promise<{ url: string | null; error: string | null }> {
    try {
        const supabase = createClient();

        // Ensure user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { url: null, error: 'You must be logged in to upload images.' };
        }

        // Create a unique filename: timestamp + random string + original extension
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${user.id}/${folder}/${fileName}`;

        // Upload the file to the 'uploads' bucket
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload Error:', error);
            return { url: null, error: error.message };
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);

        return { url: publicUrl, error: null };
    } catch (err: any) {
        console.error('Unexpected Upload Error:', err);
        return { url: null, error: err.message || 'An unexpected error occurred during upload.' };
    }
}

/**
 * Deletes an image from Supabase storage given its public URL.
 * Only targets files in the 'uploads' bucket.
 */
export async function deleteImage(url: string | null | undefined): Promise<{ success: boolean; error: string | null }> {
    if (!url) return { success: true, error: null };

    try {
        const supabase = createClient();
        
        // Supabase URLs can vary slightly (public/authenticated, project domains, etc.)
        // We look for the bucket name 'uploads' and extract the path after it
        const uploadsMarker = '/uploads/';
        if (!url.includes(uploadsMarker)) {
            return { success: true, error: null };
        }

        // Extract path after '/uploads/' and strip any query parameters
        const urlParts = url.split(uploadsMarker);
        const rawPath = urlParts[urlParts.length - 1]; 
        const filePath = rawPath.split('?')[0];
        
        if (!filePath) {
            console.error('deleteImage: Failed to extract a valid filePath from URL:', url);
            return { success: false, error: 'Could not extract file path from URL' };
        }

        const { data, error } = await supabase.storage
            .from('uploads')
            .remove([filePath]);

        if (error) {
            console.error('deleteImage: Supabase Storage API returned an error:', error);
            return { success: false, error: error.message };
        }

        if (!data || data.length === 0) {
            console.warn('deleteImage: Supabase Storage API returned success but no files were actually removed.', { filePath });
        }

        return { success: true, error: null };
    } catch (err: any) {
        console.error('deleteImage: Unexpected error:', err);
        return { success: false, error: err.message };
    }
}

