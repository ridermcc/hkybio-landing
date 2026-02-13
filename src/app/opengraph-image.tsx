import { ImageResponse } from 'next/og';
import { join } from 'path';
import { readFile } from 'fs/promises';

export const runtime = 'nodejs';

export const alt = 'hky.bio - Your Hockey Story. One Link.';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    try {
        const logoData = await readFile(join(process.cwd(), 'public/logo-black.svg'));
        const base64Logo = logoData.toString('base64');
        const logoSrc = `data:image/svg+xml;base64,${base64Logo}`;

        return new ImageResponse(
            (
                <div
                    style={{
                        background: 'white',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* @ts-ignore */}
                    <img src={logoSrc} width="454" height="288" />
                </div>
            ),
            {
                ...size,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
