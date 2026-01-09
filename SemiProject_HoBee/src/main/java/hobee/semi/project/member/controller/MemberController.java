package hobee.semi.project.member.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import hobee.semi.project.member.model.dto.MemberDTO;
import hobee.semi.project.member.model.service.MemberService;
import hobee.semi.project.profileImg.model.dto.ProfileDTO;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("member")
@SessionAttributes({"loginMember"}) // 세션 스코프에 로그인한 회원정보 저장
public class MemberController {

	
	
	private final MemberService service;
	
	
	// 로그인 페이지
	@GetMapping("loginPage")
	public String loginPage() {
		return"member/loginPage";
	}
	
	
	// 로그인 
	@PostMapping("loginPage")
	public String login(@ModelAttribute MemberDTO inputMember/*로그인 창에 쓴 값(그릇) */,
					    @ModelAttribute ProfileDTO profileDTO,
					Model model,/*값을 들고 클라이언트 이동(바구니)*/
					RedirectAttributes ra,
					@RequestParam(value = "saveId", required = false) String saveId/*saveId 값*/,
					HttpServletResponse resp /*쿠기를 클라이언트로 옮기기 위해 */
			) {
		
		try {
			// member 모든 값이 들어가져 있음
			MemberDTO loginMember = service.loginMember(inputMember);
			
			log.debug("로그인 회원 loginMember 상태 : " + loginMember);
			log.debug("체크박스 saveId 상태 : " + saveId);
			
			if(loginMember != null) {
				
				//--------------------------------------------------
				//최신 프로필 이미지 조회
//				ProfileDTO profile =
//		                service.selectLatestProfile(loginMember.getMemberNo());
//
//		        if(profile != null) {
//		            loginMember.setProfileImg(
//		                profile.getProfilePath() + profile.getProfileRename()
//		            );
//		        }
				//--------------------------------------------------
		        
				log.info("memberDTO 회원 프로필 이미지 경로 : " + loginMember.getProfileImg());				
				log.info("memberDTO 회원 닉네임 : " + loginMember.getMemberNickname());
				
				model.addAttribute("loginMember", loginMember);
				
				// 쿠키 객체 생성(회원 정보 관리하기 위해(입장권 번호))
				Cookie cookie = new Cookie("saveId",loginMember.getMemberId());
				
				// 사이트 모두 가능
				cookie.setPath("/");
				
				if(saveId != null) {// 체크함
					cookie.setMaxAge(60*60*24*30);  // 30일동안 생존 이후 삭제
				}
				else {
					cookie.setMaxAge(0); // 실패 시 0초 생존 
				}
				
		
				// 클라이언트로 이동
				resp.addCookie(cookie);
				
			}else {
				ra.addFlashAttribute("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
				return "redirect:/member/loginPage"; // 로그인 실패시 로그인 페이지로 이동
			}
			
			
			
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		
		return "redirect:/";
	}
	
	// 로그아웃
	@GetMapping("logout")
	public String logout(SessionStatus sessionStatus) {
		sessionStatus.setComplete(); // 세션 정보 비워버려
		return "redirect:/";
	}
	
	// 회원 가입 페이지
	@GetMapping("signupPage")
	public String signup() {
		return "member/signupPage";
	}
	
	// 이메일 중복 검사
	@ResponseBody
	@GetMapping("checkEmail")
	public int checkEmail(@RequestParam("memberEmail") String memberEmail) {
		return service.checkEmail(memberEmail);}


	// 아이디 중복 검사
	@ResponseBody
	@GetMapping("checkId")
	public int checkId(@RequestParam("memberId") String memberId) {
		return service.checkId(memberId);
		
	}
	
	
	// 닉네임 중복검사
	@ResponseBody
	@GetMapping("checkNickname")
	public int checNickname(@RequestParam("memberNickname") String memberNickname) {
		return service.checkNickname(memberNickname);
	}
	
	// 회원가입
	@PostMapping("signUp")
	public String signUp(MemberDTO inputMember, 
			@RequestParam("memberAddress") String[] memberAddress,
			@RequestParam(value="hobbyCode", required=false) List<String> hobbyCode,
			RedirectAttributes ra) {
		
		
		log.info("memberAddress : " + memberAddress);
		
		int result = service.signUp(inputMember,memberAddress,hobbyCode); // 회원가입 정보 모두 들어있음
		
		String path = "";
		String message = "";
		
		// 성공
		if(result >0 ) {
			path="/"; // 메인페이지로 이동
			message=inputMember.getMemberNickname()+"님 가입을 축하합니다.";
		}else {
			path = "signUp"; // 다시 가입 페이지로 
	        message = "회원 가입에 실패했습니다. 다시 시도해주세요.";
		}
		
		log.debug("회원가입시 hobbyCode 상태 : " + hobbyCode);

		
		ra.addFlashAttribute("message", message);
		
		return "redirect:" + path;
		
	}
	
	
	
	//-------------------------------------------------------------------------------------
	
	// 아이디 찾기 페이지
	@GetMapping("idSearch")
	public String idSearchPage() {
	    return "member/idSearch"; 
	}
	
	// 가입된 이름 찾기
	@ResponseBody
	@PostMapping("checkName")
	public int checkName(@RequestBody MemberDTO inputMember) {
		return service.checkName(inputMember);	
	}
	
	// 가입된 이름 찾기
	@ResponseBody
	@PostMapping("checkTel")
	public int checkTel(@RequestBody MemberDTO inputMember) {
		return service.checkTel(inputMember);	
	}
	
	// 아이디 찾기 
	@PostMapping("idSearch")
	public String idSearch(MemberDTO inputMember , Model model ,RedirectAttributes ra) {
		
		String foundId = service.findId(inputMember);
		
		if(foundId == null) {
			ra.addFlashAttribute("message","일치하는 회원 정보가 없습니다.");
	        return "redirect:idSearch"; // 실패 시 다시 찾기 페이지로
	    }
		
		model.addAttribute("foundId", foundId); // 타임리프 사용하기 위해 뿌려 주기
		
		return "member/idSearchResult"; // 결과 페이지로 이동

	}
	
	// 비밀번호 찾기 페이지
	@GetMapping("pwSearch")
	public String pwSearchPage() {
	    return "member/pwSearch"; 
	}
	
	//  새 비밀번호 
	@PostMapping("pwSearch")
	public String pwChange(MemberDTO inputMember ,RedirectAttributes ra) { 
		
		int result = service.pwChange(inputMember);
		
		String message = null;
	    String path = null;

	    if(result > 0) {
	        message = "비밀번호가 변경되었습니다.";
	        path = "redirect:/member/loginPage"; // 로그인 페이지로
	    } else {
	        message = "비밀번호 변경에 실패했습니다.";
	        path = "redirect:/member/pwSearch"; // 현재 페이지로
	    }

	    ra.addFlashAttribute("message", message);
	    
	    return path;
	}
	


}