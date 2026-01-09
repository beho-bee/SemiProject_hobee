package hobee.semi.project.common.config;

import java.util.Arrays;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import hobee.semi.project.common.filter.AdminFilter;
import hobee.semi.project.common.filter.LoginFilter;

@Configuration
public class FilterConfig {

	@Bean
	public FilterRegistrationBean<LoginFilter> loginFilter() {
		
		FilterRegistrationBean<LoginFilter> filter = new FilterRegistrationBean<>();
		
		// 필터 객체 세팅
		filter.setFilter(new LoginFilter());
		
		// 필터 동작할 URL 세팅
		String[] filteringURL = {"/myPage/*", "/editBoard/*", "/report/*", "/penalty/*"};
		
		// filter.setUrlPatterns( 컬렉션 ) => 배열 -> 컬렉션
		filter.setUrlPatterns( Arrays.asList(filteringURL) );
		
		filter.setName("loginFilter");
		
		filter.setOrder(1);
		
		return filter;
		
	}
	
	@Bean
	public FilterRegistrationBean<AdminFilter> adminFilter() {
		
		FilterRegistrationBean<AdminFilter> filter = new FilterRegistrationBean<>();
		
		// 필터 객체 세팅
		filter.setFilter(new AdminFilter());
		
		// 필터 동작할 URL 세팅
		String[] filteringURL = { "/report/manageReport", "/penalty/managePenalty", "/footer/manageCS"  };
		
		// filter.setUrlPatterns( 컬렉션 ) => 배열 -> 컬렉션
		filter.setUrlPatterns( Arrays.asList(filteringURL) );
		
		filter.setName("adminFilter");
		
		filter.setOrder(2);
		
		return filter;
		
	}
	
}
