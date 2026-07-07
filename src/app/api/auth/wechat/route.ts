import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

// 微信登录接口 - 接收小程序 code，换取 openid 和 session_key
export async function POST(req: NextRequest) {
  try {
    const { code, nickname, avatarUrl } = await req.json();

    if (!code) {
      return NextResponse.json({ error: '缺少 code 参数' }, { status: 400 });
    }

    // 调用微信 code2Session 接口
    const appId = process.env.WECHAT_APPID;
    const appSecret = process.env.WECHAT_APPSECRET;

    if (!appId || !appSecret) {
      return NextResponse.json(
        { error: '微信配置未设置' },
        { status: 500 }
      );
    }

    const wxRes = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
    );

    const wxData = await wxRes.json();

    if (wxData.errcode) {
      return NextResponse.json(
        { error: `微信登录失败: ${wxData.errmsg}` },
        { status: 400 }
      );
    }

    const { openid, session_key } = wxData;

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { email: `wechat_${openid}@miniapp` },
    });

    if (!user) {
      // 创建新用户
      const randomPassword = randomBytes(16).toString('hex');
      user = await prisma.user.create({
        data: {
          email: `wechat_${openid}@miniapp`,
          name: nickname || '微信用户',
          password: randomPassword, // 随机密码，不需要用户记忆
        },
      });
    }

    // 生成简单的 JWT token（生产环境建议用 jsonwebtoken）
    const tokenPayload = JSON.stringify({
      userId: user.id,
      openid,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天
    });
    const token = Buffer.from(tokenPayload).toString('base64');

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('微信登录错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
