import {
  User as PrismaUser,
  Post as PrismaPost,
  SubCommunity as PrismaSubCommunity,
  VoteType as PrismaVoteType,
  Vote as PrismaVote,
} from "../../backend/node_modules/@prisma/client";

export type User = PrismaUser;
export type Post = PrismaPost & {
  User: PrismaUser;
  SubCommunity: PrismaSubCommunity;
  Vote: PrismaVote[];
};
export type VoteType = PrismaVoteType;
export type Vote = PrismaVote;
