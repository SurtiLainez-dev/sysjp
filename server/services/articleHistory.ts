import { prisma } from '@/server/utils/prisma'

export type LogArticleHistoryParams = {
    articleId: number
    description: string
}
export async function logArticleHistory(articleId:number,description:string) {


    await prisma.article_historys.create({
        data: {
            article_id: articleId,
            description: description,
        },
    })
}
