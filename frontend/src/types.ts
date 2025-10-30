import {
  User as PrismaUser,
  Post as PrismaPost,
  SubCommunity as PrismaSubCommunity,
  VoteType as PrismaVoteType,
} from "../../backend/node_modules/@prisma/client";

export type User = PrismaUser;
export type Post = PrismaPost & {
  User: PrismaUser;
  SubCommunity: PrismaSubCommunity;
};
export type VoteType = PrismaVoteType;
