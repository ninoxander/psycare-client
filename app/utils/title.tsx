import type { MetaFunction } from "@remix-run/node";

export const createMeta = (title: string, description: string) => {
    return [
        { title: `${title} | Psycare` },
        {
            property: "og:title",
            content: title,
        },
        {
            name: "description",
            content: description,
        },
    ];
};
