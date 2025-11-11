import {
  User as PrismaUser,
  Post as PrismaPost,
  SubCommunity as PrismaSubCommunity,
  VoteType as PrismaVoteType,
  Vote as PrismaVote,
  Comment as PrismaComment,
  SavedPost as PrismaSavedPost,
} from "../../backend/node_modules/@prisma/client";
export type User = PrismaUser;
export type VoteType = PrismaVoteType;
export type Vote = PrismaVote;
export type SavedPost = PrismaSavedPost;
export type Post = PrismaPost & {
  User: PrismaUser;
  SubCommunity: PrismaSubCommunity;
  Vote: PrismaVote[];
  Comment: PrismaComment[];
};
export type Comment = PrismaComment & {
  User: PrismaUser;
  Vote: PrismaVote[];
  _count: {
    other_Comment: number;
  };
};
